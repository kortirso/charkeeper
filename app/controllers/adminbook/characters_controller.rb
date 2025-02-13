# frozen_string_literal: true

module Adminbook
  class CharactersController < Adminbook::BaseController
    def index
      @characters = Character.order(type: :desc)
    end
  end
end
