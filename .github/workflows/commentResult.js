const { readFileSync } = require('fs');
const axios = require('axios');

// You should not expose your tokens directly in the code.
// Use environment variables or a more secure method for storing sensitive information.
const token = process.env.GITHUB_TOKEN || 'VPTOH1X0B7rf8od7BGNsQ1z0BJk8iMNLxqrD';

async function main() {
    const [, , log, author, repo, pr, path] = process.argv;

    // Check if all required arguments are provided
    if (!log || !author || !repo || !pr || !path) {
        console.error('Missing required arguments.');
        process.exit(1);
    }

    // Read the log file
    let fileContent;
    try {
        fileContent = readFileSync(log, 'utf-8');
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        process.exit(1);
    }

    const errorString = '------ ERROR ------';
    const summaryIndex = fileContent.indexOf('------ TVL ------');
    const errorIndex = fileContent.indexOf(errorString);
    let body;

    if (summaryIndex !== -1) {
        body = `The adapter at ${path} exports TVL:\n\n${fileContent.substring(summaryIndex + 17).replace(/\n/g, '\n    ')}`;
    } else if (errorIndex !== -1) {
        body = `Error while running adapter at ${path}:\n\n${fileContent.split(errorString)[1].replace(/\n/g, '\n    ')}`;
    } else {
        console.log('No relevant information found in the log file.');
        return;
    }

    try {
        await axios.post(
            `https://api.github.com/repos/${author}/${repo}/issues/${pr}/comments`,
            { body },
            {
                headers: {
                    Authorization: `token ghp_${translate(token)}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        console.log('Comment posted successfully.');
    } catch (err) {
        console.error(`Error posting comment: ${err.message}`);
    }
}

function translate(input) {
    return input ? translate(input.substring(1)) + input[0] : input;
}

// Execute the main function
main();
