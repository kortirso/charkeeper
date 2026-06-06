# frozen_string_literal: true

module Adminbook
  module Cthulhu7
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Cthulhu7::Character'
      end

      def provider
        'cthulhu7'
      end
    end
  end
end
