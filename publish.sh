set -e

VERSION="1.4" # Update this

source ".firefox_data.sh"

cd extension
web-ext sign \
    -a="../artifacts" \
    --channel=unlisted \
    --api-key=$WEB_EXT_API_KEY \
    --api-secret=$WEB_EXT_API_SECRET
cd ..

cat > update.json <<EOF
{
  "addons": {
    "2dd5db85f9cb4d5f8e60": {
      "updates": [
        {
          "version": "$VERSION",
          "update_link": "https://raw.githubusercontent.com/otcova/multitab-video-synchronizer/refs/heads/main/artifacts/2dd5db85f9cb4d5f8e60-$VERSION.xpi"
        }
      ]
    }
  }
}
EOF
