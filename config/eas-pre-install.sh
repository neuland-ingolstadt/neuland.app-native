#!/usr/bin/env bash
set -euo pipefail

LFS_SCAN_DIRS=(src/assets)

is_lfs_pointer() {
	[[ -f "$1" ]] && head -1 "$1" | grep -q '^version https://git-lfs.github.com/spec/v1'
}

list_lfs_pointers() {
	while IFS= read -r -d '' file; do
		if is_lfs_pointer "$file"; then
			printf '%s\n' "$file"
		fi
	done < <(
		find "${LFS_SCAN_DIRS[@]}" -type f \
			\( -name '*.png' -o -name '*.svg' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' -o -name '*.ttf' \) \
			-print0 2>/dev/null
	)
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

missing_assets="$(list_lfs_pointers || true)"
if [[ -z "$missing_assets" ]]; then
	echo "=====> Git LFS assets already present"
	exit 0
fi

if [[ ! -d .git ]]; then
	echo "=====> Git LFS assets are missing and there is no .git directory to pull them:"
	printf '%s\n' "$missing_assets"
	echo "=====> Use a Git-based EAS build or run 'git lfs pull' before uploading the project archive"
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

missing_assets="$(list_lfs_pointers || true)"
if [[ -z "$missing_assets" ]]; then
	exit 0
fi

echo "=====> Git LFS pull failed (exit ${pull_status}) and assets are still missing:"
printf '%s\n' "$missing_assets"
exit 1
