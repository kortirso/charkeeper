# frozen_string_literal: true

module Adminbook
  class CharactersController < Adminbook::BaseController
    def index
      @characters = Character.where(type: character_type).order(created_at: :desc)
      render template: "adminbook/#{provider}/characters/index"
    end
  end
end
