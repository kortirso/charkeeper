# frozen_string_literal: true

module Adminbook
  class ReportsController < Adminbook::BaseController
    def download
      homebrew = Homebrew.find(params.expect(:homebrew_id))
      send_data(
        JSON.pretty_generate(homebrew.to_homebrew_json),
        filename: "#{homebrew.title['en'].underscore}.json",
        type: 'application/json',
        disposition: 'attachment'
      )
    end
  end
end
