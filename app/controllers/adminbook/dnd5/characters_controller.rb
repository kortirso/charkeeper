# frozen_string_literal: true

module Adminbook
  module Dnd5
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Dnd5::Character'
      end

      def provider
        'dnd5'
      end
    end
  end
end
