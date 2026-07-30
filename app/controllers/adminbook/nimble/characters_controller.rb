# frozen_string_literal: true

module Adminbook
  module Nimble
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Nimble::Character'
      end

      def provider
        'nimble'
      end
    end
  end
end
