#!/bin/bash

# Check if curl is installed
if ! command -v curl &>/dev/null; then
    echo "Error: curl is not installed. Please install it and try again."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &>/dev/null; then
    echo "Error: jq is not installed. Please install it and try again."
    exit 1
fi

if curl -s --head --request GET http://localhost:4040 | grep "302 Found" >/dev/null; then
    URL=$(curl -s localhost:4040/api/tunnels | jq -r '.tunnels[] | select(.proto == "https") | .public_url')

    case "$OSTYPE" in
    linux*)
        if command -v xdg-open >/dev/null; then
            xdg-open "$URL"
        else
            echo "Error: xdg-open not found. Please open the URL manually: $URL"
        fi
        ;;
    darwin*)
        if command -v open >/dev/null; then
            open "$URL"
        else
            echo "Error: open command not found. Please open the URL manually: $URL"
        fi
        ;;
    msys* | cygwin*)
        if command -v start >/dev/null; then
            start "$URL"
        else
            echo "Error: start command not found. Please open the URL manually: $URL"
        fi
        ;;
    *)
        echo "Error: Unsupported operating system. Please open the URL manually: $URL"
        ;;
    esac
else
    echo "run 'yarn ngrok' first"
fi
