# frozen_string_literal: true

module Config
  extend self

  def data(provider, key, version: '0.4.10')
    Rails.cache.fetch("#{provider}/#{key}/#{version}", expires_in: 3.days) { load_data(provider, key) }
  end

  private

  def load_data(provider, key)
    JSON.parse(Rails.root.join("config/settings/#{provider}/#{key}.json").read)
  end
end
