# frozen_string_literal: true

module BeastformConfig
  extend self

  def data
    @data ||= load_data
  end

  private

  def load_data
    JSON.parse(File.read(data_path))
  end

  def data_path
    Rails.root.join('config/settings/beastform.json')
  end
end
