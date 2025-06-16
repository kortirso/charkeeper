# frozen_string_literal: true

module Adminbook
  module Dnd2024
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Dnd2024::Character'
      end

      def provider
        'dnd2024'
      end
    end
  end
end
