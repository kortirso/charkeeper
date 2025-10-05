# frozen_string_literal: true

module PlatformConfig
  extend self

  def data(provider)
    Rails.cache.fetch(provider) { load_data(provider) }
  end

  private

  def load_data(provider)
    JSON.parse(Rails.root.join("app/javascript/applications/CharKeeperApp/data/#{provider}.json").read)
  end
end
