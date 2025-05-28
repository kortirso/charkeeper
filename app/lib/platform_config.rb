# frozen_string_literal: true

module PlatformConfig
  extend self

  def data(provider)
    @data ||= {}
    @data.fetch(provider) do |key|
      @data[key] = load_data(provider)
    end
  end

  private

  def load_data(provider)
    file = File.read(data_path(provider))
    @data = JSON.parse(file)
  end

  def data_path(provider)
    Rails.root.join("app/javascript/applications/WebTelegram/data/#{provider}.json")
  end
end
