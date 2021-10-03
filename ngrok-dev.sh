if curl -s --head --request GET http://localhost:4040 | grep "302 Found" >/dev/null; then
    URL=$(curl -s localhost:4040/api/tunnels | jq -r ".tunnels[0].public_url")

    if command -v open >/dev/null; then
        open "$URL"
    else
        start chrome "$URL"
    fi

else
    echo "run 'yarn ngrok' first"
fi
