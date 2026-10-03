Pod::Spec.new do |s|
  s.name           = 'AppClip'
  s.version        = '1.0.0'
  s.summary        = 'App Clip helpers (detection + SKOverlay)'
  s.description    = 'Detect App Clip context and recommend the full Neuland Next app via SKOverlay'
  s.author         = 'Neuland Ingolstadt e.V.'
  s.homepage       = 'https://neuland.app'
  s.platforms      = {
    :ios => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
