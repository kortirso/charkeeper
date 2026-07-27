# frozen_string_literal: true

module CharactersContext
  module Nimble
    class CreateCommand < BaseCommand
      use_contract do
        Ancestries = Dry::Types['strict.string'].enum(*::Nimble::Character.ancestries.keys)
        Classes = Dry::Types['strict.string'].enum(*::Nimble::Character.classes_info.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:main_class).filled(Classes)
          required(:ancestry).filled(Ancestries)
          optional(:skip_guide).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        input[:data] = build_fresh_character(input.slice(:main_class, :ancestry, :skip_guide).symbolize_keys)
      end

      def do_persist(input)
        character = ::Nimble::Character.create!(input.slice(:user, :name, :data))

        { result: character }
      end

      def build_fresh_character(data)
        NimbleCharacter::BaseBuilder.new.call(result: data)
          .then { |result| NimbleCharacter::ClassBuilder.new.call(result: result) }
      end
    end
  end
end
