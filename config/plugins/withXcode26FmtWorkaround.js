const { withPodfile } = require('expo/config-plugins')
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode')

const TAG = 'neuland:xcode26-fmt-workaround'

const FMT_WORKAROUND = `      # https://github.com/expo/expo/issues/44229#issuecomment-4125779703
      # Workaround for Xcode 26: newer Apple Clang breaks consteval in fmt 11.0.2.
      # TODO: Remove after upgrading to Expo 55 (or newer)
      # fix from: https://github.com/expo/expo/issues/44229#issuecomment-4134299446
      fmt_base = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
      xcode_version = \`xcodebuild -version\`.match(/Xcode ([\\d.]+)/)[1] rescue nil

      if File.exist?(fmt_base) && (xcode_version.nil? || xcode_version.to_f >= 26.4)
        content = File.read(fmt_base)
        unless content.include?('Xcode 26 workaround')
          patched = content.gsub(
            /^(#elif defined\\(__cpp_consteval\\)\\n#  define FMT_USE_CONSTEVAL) 1/,
            "// Xcode 26 workaround: disable consteval\\n\\\\1 0"
          )
          if patched != content
            File.chmod(0644, fmt_base)
            File.write(fmt_base, patched)
          else
            Pod::UI.puts "[Podfile] Xcode 26.4 fmt workaround not applied: expected pattern not found in #{fmt_base}. The header may have changed; please update or remove this patch."
          end
        end
      end`

function applyXcode26FmtWorkaround(contents) {
	const result = mergeContents({
		tag: TAG,
		src: contents,
		newSrc: FMT_WORKAROUND,
		anchor: /:ccache_enabled => ccache_enabled\?\(podfile_properties\),/,
		offset: 2,
		comment: '#'
	})

	if (result.didMerge || result.didClear) {
		return result.contents
	}

	return contents
}

function withXcode26FmtWorkaround(expoConfig) {
	return withPodfile(expoConfig, (modConfig) => {
		modConfig.modResults.contents = applyXcode26FmtWorkaround(
			modConfig.modResults.contents
		)
		return modConfig
	})
}

module.exports = withXcode26FmtWorkaround
