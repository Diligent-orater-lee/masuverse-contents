
import * as AdmZip from 'adm-zip';
import axios, { AxiosResponse } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { environment } from '../environment';
import { ProjectUpdateResponse } from '../types/interfaces/api-interfaces';

const command = process.argv[2];

function runCommand() {
    switch (command) {
        case '--make-project':
            createProject();
            break;
    
        case '--upload-project':
            const projectId = process.argv[3];
            if (!projectId) {
                console.log('Project Id not provided');
                break;
            }

            uploadProjectFiles(projectId);
            break;
    
        default:
            console.log('invalid command');
            break;
    }
}

if (command) {
    runCommand();
} else {
    console.log('No command provided');
}

async function createProject() {
    // const apiUrl = environment.appUrl + "project/create-project";

    // const response: AxiosResponse<ProjectCreateResponse> = await axios.post(apiUrl, {email: environment.email, token: environment.authToken}, {
    //     headers: {
    //         'Content-Type': 'application/json;charset=utf-8'
    //     },
    //     httpsAgent: new https.Agent({
    //         rejectUnauthorized: false
    //     })
    // });

    const response = {
        data: {
            success: true,
            folderName: 'R2nou9W0qrbP3nCO'
        }
    }

    if (response.data.success) {
        const folderName = response.data.folderName;
        createLocalFolder(folderName);
        console.log(`Created project folder: ${response.data.folderName}`);
    } else {
        console.log('Failed to create project');
    }
}

async function uploadProjectFiles(
  projectFolder: string,
): Promise<ProjectUpdateResponse> {
  try {
    // Create a new zip file
    const zip = new AdmZip();

    // Read all files in the folder
    const projectsRoot = path.join(process.cwd(), "src", 'projects');
    const filesPath = path.join(projectsRoot, projectFolder);
    const files = await fs.promises.readdir(filesPath);

    // Add each file to the zip
    for (const file of files) {
      const filePath = path.join(filesPath, file);
      const content = await fs.promises.readFile(filePath);
      zip.addFile(file, content);
    }

    // Generate the zip buffer
    const zipBuffer = zip.toBuffer();

    const apiUrl = environment.appUrl + "project/update-project-files";

    // Create form data
    const formData = new FormData();
    formData.append('email', environment.email);
    formData.append('token', environment.authToken);
    formData.append('trackerId', projectFolder);
    formData.append('file', zipBuffer, { filename: 'project_files.zip', contentType: 'application/zip' });

    // Make the API request
    const response: AxiosResponse<ProjectUpdateResponse> = await axios.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false
      })
    });

    console.log('Upload successful:', response.data);
    return response.data;
    return null as any;
  } catch (error) {
    console.error('Error uploading project files:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

async function createLocalFolder(folderName: string): Promise<void> {
    const localStoragePath = path.join(__dirname, "..", "..", "src", "projects");
    const folderPath = path.join(localStoragePath, folderName);
    
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        fs.copyFileSync(path.join(__dirname, "..", "..", "templates", "index.tsfile"), path.join(folderPath, "index.ts"));
    }
}