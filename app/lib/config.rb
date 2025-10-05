# frozen_string_literal: true

module Config
  extend self

  def data(provider, key)
    Rails.cache.fetch("#{provider}/#{key}") { load_data(provider, key) }
  end

  private

  def load_data(provider, key)
    JSON.parse(Rails.root.join("config/settings/#{provider}/#{key}.json").read)
  end
end
