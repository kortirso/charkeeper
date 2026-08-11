# frozen_string_literal: true

module CharactersContext
  module Nimble
    class CreateCommand < BaseCommand
      include Deps[
        add_feat: 'commands.characters_context.nimble.feats.add'
      ]

      use_contract do
        Classes = Dry::Types['strict.string'].enum(*::Nimble::Character.classes_info.keys)
        Sizes = Dry::Types['strict.string'].enum(*::Nimble::Character.sizes.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:main_class).filled(Classes)
          required(:ancestry).filled(:string)
          required(:size).filled(Sizes)
          optional(:skip_guide).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        input[:data] = build_fresh_character(input.slice(:main_class, :ancestry, :size, :skip_guide).symbolize_keys)
      end

      def do_persist(input)
        character = ::Nimble::Character.create!(input.slice(:user, :name, :data))

        attach_feats(character)

        { result: character }
      end

      def build_fresh_character(data)
        NimbleCharacter::BaseBuilder.new.call(result: data)
          .then { |result| NimbleCharacter::ClassBuilder.new.call(result: result) }
      end

      def attach_feats(character)
        feats_relation(character).each do |feat|
          add_feat.call({ character: character, feat: feat })
        end
      end

      def feats_relation(character)
        ::Nimble::Feat.where(origin: 0, origin_value: character.data.ancestry)
          .or(::Nimble::Feat.where(origin: 1, origin_value: character.data.main_class).where("conditions ->> 'level' = '1'"))
      end
    end
  end
end
