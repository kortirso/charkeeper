# frozen_string_literal: true

module Adminbook
  module Pathfinder2
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Pathfinder2::Character'
      end

      def provider
        'pathfinder2'
      end
    end
  end
end
