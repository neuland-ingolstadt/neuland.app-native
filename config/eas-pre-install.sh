#!/usr/bin/env bash
set -euo pipefail

pull_git_lfs() {
	git lfs install --local 2>/dev/null || git lfs install
	git lfs fetch --all
	git lfs checkout
}

ensure_git_lfs() {
	if command -v git-lfs >/dev/null 2>&1; then
		return 0
	fi

	echo "=====> Installing git-lfs"
	if [[ "${EAS_BUILD_PLATFORM:-}" == "ios" ]]; then
		HOMEBREW_NO_AUTO_UPDATE=1 brew install git-lfs
	elif [[ "${EAS_BUILD_PLATFORM:-}" == "android" ]]; then
		curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
		sudo apt-get install -y git-lfs
	else
		echo "=====> Unknown EAS_BUILD_PLATFORM, skipping git-lfs install"
		return 1
	fi
}

if [[ ! -d .git ]]; then
	echo "=====> No .git directory — skipping Git LFS pull (archive upload build)"
	exit 0
fi

echo "=====> Pulling Git LFS assets"
if command -v git-lfs >/dev/null 2>&1 || ensure_git_lfs; then
	pull_git_lfs
else
	echo "=====> git-lfs is unavailable; image assets may be missing"
	exit 1
fi
