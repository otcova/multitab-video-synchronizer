#!/bin/bash

set -e

VERSION="1.6" # Update this

echo "Publishing version $VERSION ..."
echo "(Remember to set the version in the ./publish.sh and ./extension/maniferst.json)"

# Gen keys at: https://addons.mozilla.org/en-GB/developers/addon/api/key/
source ".firefox_data.sh"

web-ext sign \
  --channel=unlisted \
  -s="./extension" \
  -a="./artifacts" \
  --api-key="$WEB_EXT_API_KEY" \
  --api-secret="$WEB_EXT_API_SECRET"

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
