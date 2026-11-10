const vscode				=	require('vscode');
const fs					=	require('fs');
const path					=	require('path');
const TITLE_CONTEXT_KEY		=	'dynamicProjectTitle.projectTitle';

function getWindowTitleConfiguration() {
	const config = vscode.workspace.getConfiguration('window');
	return config.inspect('title');
}

/**
 * Reads a JSON file and returns its contents.
 *
 * @param {string} filePath
 * @returns {object|null}
 */

function readJsonFile(filePath) {

	if(!fs.existsSync(filePath)) {
		return null;
	}

	try {
		const contents = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(contents);
	}
	catch (error) {
		console.error(`Unable to read ${filePath}:`, error);
		return null;
	}

}

/**
 * Gets a project title from supported config files.
 *
 * Priority:
 * 1. wireferry.json
 * 2. sftp.json
 * 
 * @param {string} workspacePath
 * @returns {{ title: string, source: string }|null}
 */

function getProjectTitle(workspacePath) {

	const vscodePath	=	path.join(workspacePath, '.vscode');
	const files 		=	[

								'wireferry.json',
								'sftp.json'

							];

	for(const file of files) {

		const config = readJsonFile(path.join(vscodePath,file));

		if(

			config								&&
			typeof config.name === 'string'		&&
			config.name.trim() !== ''

		) {

			return {

				title	:	config.name.trim(),
				source	:	file

			};

		}

	}

	return null;
}

async function updateProjectTitle(showNotification = false) {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

	if(!workspaceFolder) {
		return;
	}

	const projectTitle = getProjectTitle(workspaceFolder.uri.fsPath);

	if(projectTitle) {

		await vscode.commands.executeCommand(
			'setContext',
			TITLE_CONTEXT_KEY,
			projectTitle.title
		);

		if(showNotification) {
			vscode.window.showInformationMessage(
				`Dynamic Project Title: Set from ${projectTitle.source}`
			);
		}

		return;
	}

	await vscode.commands.executeCommand(
		'setContext',
		TITLE_CONTEXT_KEY,
		workspaceFolder.name
	);

	if(showNotification) {
		vscode.window.showInformationMessage(
			'Dynamic Project Title: Set from workspace name'
		);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */

	async function activate(context) {
	
	const setCustomTitleCommand = vscode.commands.registerCommand( 'dynamic-project-title.setCustomTitle',async () => {

		const title = await vscode.window.showInputBox({
			prompt: 'Enter a custom window title',
			placeHolder: 'My Project'
		});

		if(title === undefined) {
			return;
		}

		const trimmedTitle = title.trim();

		if(!trimmedTitle) {
			vscode.window.showWarningMessage(
				'Dynamic Project Title: Please enter a window title.'
			);

			return;
		}

		const config = vscode.workspace.getConfiguration('window');

		await config.update(
			'title',
			trimmedTitle,
			vscode.ConfigurationTarget.Workspace
		);

		vscode.window.showInformationMessage(
			`Dynamic Project Title: Window title set to "${trimmedTitle}".`
		);

	});

	const removeCustomTitleCommand = vscode.commands.registerCommand('dynamic-project-title.removeCustomTitle',async () => {

		const config = vscode.workspace.getConfiguration('window');

		await config.update(
			'title',
			undefined,
			vscode.ConfigurationTarget.Workspace
		);

		await updateProjectTitle(false);

		vscode.window.showInformationMessage(
			'Dynamic Project Title: Custom window title removed.'
		);
	});

	context.subscriptions.push(
		setCustomTitleCommand,
		removeCustomTitleCommand
	);

	await vscode.commands.executeCommand(
		'registerWindowTitleVariable',
		'projectTitle',
		TITLE_CONTEXT_KEY
	);

	const titleConfig = getWindowTitleConfiguration();

	const hasWorkspaceOverride =
		titleConfig?.workspaceValue !== undefined ||
		titleConfig?.workspaceFolderValue !== undefined;

	const hasGlobalOverride =
		titleConfig?.globalValue !== undefined;

	if(hasWorkspaceOverride) {
		vscode.window.showInformationMessage(
			'Dynamic Project Title: Using Workspace window.title Override'
		);
	}
	else if(hasGlobalOverride) {
		vscode.window.showWarningMessage(
			'Dynamic Project Title: Your User window.title Setting Overrides This Extension. Remove Window Title From Your User Settings To Allow Dynamic Project Title To Manage It.'
		);
	}

	await updateProjectTitle(!hasWorkspaceOverride && !hasGlobalOverride);

	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

	if(!workspaceFolder) {
		return;
	}

	const wireferryWatcher = vscode.workspace.createFileSystemWatcher(
		new vscode.RelativePattern(
			workspaceFolder,
			'.vscode/wireferry.json'
		)
	);

	const sftpWatcher = vscode.workspace.createFileSystemWatcher(
		new vscode.RelativePattern(
			workspaceFolder,
			'.vscode/sftp.json'
		)
	);

	const refreshTitle = () => {
		void updateProjectTitle(false);
	};

	wireferryWatcher.onDidCreate(refreshTitle);
	wireferryWatcher.onDidChange(refreshTitle);
	wireferryWatcher.onDidDelete(refreshTitle);

	sftpWatcher.onDidCreate(refreshTitle);
	sftpWatcher.onDidChange(refreshTitle);
	sftpWatcher.onDidDelete(refreshTitle);

	context.subscriptions.push(
		wireferryWatcher,
		sftpWatcher
	);

}

async function deactivate() {
	await vscode.commands.executeCommand('setContext',TITLE_CONTEXT_KEY,undefined);
}

module.exports = {

	activate,
	deactivate

};