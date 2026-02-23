# frozen_string_literal: true

module CharactersContext
  module Fallout
    class CreateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :fallout_character

        Origins = Dry::Types['strict.string'].enum(*::Fallout::Character.origins.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:origin).filled(Origins)
        end
      end

      private

      def do_prepare(input)
        input[:data] = build_fresh_character(input.slice(:origin).symbolize_keys)
      end

      def do_persist(input)
        character = ::Fallout::Character.create!(input.slice(:user, :name, :data))

        { result: character }
      end

      def build_fresh_character(data)
        FalloutCharacter::BaseBuilder.new.call(result: data)
          .then { |result| FalloutCharacter::OriginBuilder.new.call(result: result) }
      end
    end
  end
end
