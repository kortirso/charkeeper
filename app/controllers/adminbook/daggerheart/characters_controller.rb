# frozen_string_literal: true

module Adminbook
  module Daggerheart
    class CharactersController < Adminbook::CharactersController
      private

      def character_type
        'Daggerheart::Character'
      end

      def provider
        'daggerheart'
      end
    end
  end
end
