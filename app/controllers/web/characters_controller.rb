# frozen_string_literal: true

module Web
  class CharactersController < ApplicationController
    before_action :find_rules, only: %i[index]
    before_action :find_characters, only: %i[index]

    def index; end

    private

    def find_rules
      @rules = Rule.pluck(:id, :name).to_h
    end

    def find_characters
      @characters = Character.all.load
    end
  end
end
