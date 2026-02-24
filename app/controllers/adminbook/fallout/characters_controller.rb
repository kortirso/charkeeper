# frozen_string_literal: true

module Adminbook
  module Fallout
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Fallout::Character'
      end

      def provider
        'fallout'
      end
    end
  end
end
