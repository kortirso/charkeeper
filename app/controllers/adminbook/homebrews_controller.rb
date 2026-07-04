# frozen_string_literal: true

module Adminbook
  class HomebrewsController < Adminbook::BaseController
    def edit
      @homebrew = Homebrew.find(params.expect(:id))
    end

    def update
      homebrew = Homebrew.find(params.expect(:id))
      homebrew.update(transform_params(homebrew_params))
    end

    private

    def transform_params(updating_params)
      %w[title description info].each do |attribute|
        updating_params[attribute] = JSON.parse(updating_params[attribute].gsub(' =>', ':').gsub('nil', 'null'))
      end
      updating_params
    end

    def homebrew_params
      params.require(:homebrew).permit!.to_h
    end
  end
end
