# frozen_string_literal: true

module CharactersContext
  module Dc20
    class CreateCommand < BaseCommand
      use_contract do
        config.messages.namespace = :dc20_character

        Classes = Dry::Types['strict.string'].enum(*::Dc20::Character.classes_info.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:main_class).filled(Classes)
          required(:ancestry_feats).hash
        end
      end

      private

      def do_prepare(input)
        input[:data] = build_fresh_character(input.slice(:main_class, :ancestry_feats).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dc20::Character.create!(input.slice(:user, :name, :data))
        attach_feats(character, input[:ancestry_feats].values.flatten)

        { result: character }
      end

      def build_fresh_character(data)
        Dc20Character::BaseBuilder.new.call(result: data)
          .then { |result| Dc20Character::ClassBuilder.new.call(result: result) }
      end

      def attach_feats(character, feat_slugs)
        feats_for_adding = feats_relation(character, feat_slugs).map do |feat|
          {
            feat_id: feat.id,
            character_id: character.id,
            used_count: 0,
            limit_refresh: feat.limit_refresh,
            ready_to_use: true
          }
        end
        ::Character::Feat.upsert_all(feats_for_adding) if feats_for_adding.any?
      end

      def feats_relation(character, feat_slugs)
        ::Dc20::Feat.where(origin: 0, slug: feat_slugs)
          .or(::Dc20::Feat.where(origin: [1, 2], origin_value: character.data.main_class).where("conditions ->> 'level' = '1'"))
          .or(::Dc20::Feat.where(origin: 3, slug: character.data.maneuvers))
      end
    end
  end
end
