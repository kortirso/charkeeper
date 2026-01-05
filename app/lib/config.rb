# frozen_string_literal: true

module Config
  extend self

  def data(provider, key, version: '0.4.0')
    Rails.cache.fetch("#{provider}/#{key}/#{version}") { load_data(provider, key) }
  end

  private

  def load_data(provider, key)
    JSON.parse(Rails.root.join("config/settings/#{provider}/#{key}.json").read)
  end
end
