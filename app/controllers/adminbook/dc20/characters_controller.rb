# frozen_string_literal: true

module Adminbook
  module Dc20
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Dc20::Character'
      end

      def provider
        'dc20'
      end
    end
  end
end
