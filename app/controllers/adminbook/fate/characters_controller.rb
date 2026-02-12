# frozen_string_literal: true

module Adminbook
  module Fate
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Fate::Character'
      end

      def provider
        'fate'
      end
    end
  end
end
