# frozen_string_literal: true

module Adminbook
  class CharactersController < Adminbook::BaseController
    def index
      @pagy, @characters = pagy(Character.where(type: character_type).order(created_at: :desc), limit: 25)
      render template: "adminbook/#{provider}/characters/index"
    end
  end
end
