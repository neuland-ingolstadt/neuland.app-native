#!/usr/bin/env bash
set -euo pipefail

LFS_ASSET_PATHS=(
	src/assets/android/ic_launcher.png
	src/assets/android/ic_launcher_foreground.png
	src/assets/splash/splashIconDark.png
	src/assets/wallet/apple_wallet_de.svg
	src/assets/wallet/apple_wallet_en.svg
	src/assets/wallet/google_wallet_de.svg
	src/assets/wallet/google_wallet_en.svg
)

is_lfs_pointer() {
	[[ -f "$1" ]] && head -1 "$1" | grep -q '^version https://git-lfs.github.com/spec/v1'
}

lfs_assets_ready() {
	for asset in "${LFS_ASSET_PATHS[@]}"; do
		if [[ ! -f "$asset" ]] || is_lfs_pointer "$asset"; then
			return 1
		fi
	done
}

pull_git_lfs() {
	git lfs install --local 2>/dev/null || git lfs install

	# CI checkouts can leave runner-local file:// LFS storage behind.
	git config --local --unset-all lfs.url 2>/dev/null || true
	git config --local --unset-all lfs.storage 2>/dev/null || true

	git lfs pull
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

if lfs_assets_ready; then
	echo "=====> Git LFS assets already present — skipping pull"
	exit 0
fi

if [[ ! -d .git ]]; then
	echo "=====> Git LFS assets are missing and there is no .git directory to pull them"
	exit 1
fi

echo "=====> Pulling Git LFS assets"
if ! command -v git-lfs >/dev/null 2>&1 && ! ensure_git_lfs; then
	echo "=====> git-lfs is unavailable; image assets may be missing"
	exit 1
fi

set +e
pull_git_lfs
pull_status=$?
set -e

if lfs_assets_ready; then
	exit 0
fi

echo "=====> Git LFS pull failed (exit ${pull_status}) and image assets are still missing"
exit 1
