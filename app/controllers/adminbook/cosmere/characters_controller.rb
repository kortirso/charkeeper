# frozen_string_literal: true

module Adminbook
  module Cosmere
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Cosmere::Character'
      end

      def provider
        'cosmere'
      end
    end
  end
end
