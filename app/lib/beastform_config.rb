# frozen_string_literal: true

module BeastformConfig
  extend self

  def data(provider)
    @data ||= {}
    @data.fetch(provider) do |key|
      @data[key] = load_data(provider)
    end
  end

  private

  def load_data(provider)
    JSON.parse(File.read(data_path(provider)))
  end

  def data_path(provider)
    Rails.root.join("config/settings/beastforms/#{provider}.json")
  end
end
