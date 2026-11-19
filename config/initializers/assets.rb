# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Tailwind bundles are built into app/assets/builds and must be declared explicitly.
Rails.application.config.assets.precompile += %w[tailwind_rails.css tailwind.css tailwind_v2.css]

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path
