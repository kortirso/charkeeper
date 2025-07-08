# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class RefreshFeats
      def call(character:)
        existing_ids = Character::Feat.where(character_id: character.id).pluck(:feat_id)

        feats_for_adding = available_feats(character, existing_ids)
        return if feats_for_adding.blank?

        feats_for_adding.map! do |item|
          {
            character_id: character.id,
            feat_id: item.id,
            used_count: 0,
            limit_refresh: item.limit_refresh
          }
        end
        ::Character::Feat.upsert_all(feats_for_adding)
      end

      private

      def available_feats(character, existing_ids)
        feats(character).select(:id, :conditions, :origin, :origin_value, :limit_refresh).filter_map do |item|
          next if item.id.in?(existing_ids)
          next item if item.conditions.blank?

          # rubocop: disable Style/SoleNestedConditional
          if item.origin == 'subclass' && item.conditions.key?('subclass_mastery')
            next if character.data.subclasses_mastery[item.origin_value] < item.conditions['subclass_mastery']
          end
          # rubocop: enable Style/SoleNestedConditional

          item
        end
      end

      # rubocop: disable Metrics/AbcSize
      def feats(character)
        data = character.data
        ::Daggerheart::Feat.where(origin: 'ancestry', origin_value: data.heritage)
          .or(::Daggerheart::Feat.where(origin: 'ancestry', slug: data.heritage_features))
          .or(::Daggerheart::Feat.where(origin: 'community', origin_value: data.community))
          .or(::Daggerheart::Feat.where(origin: 'class', origin_value: data.classes.keys))
          .or(::Daggerheart::Feat.where(origin: 'subclass', origin_value: data.subclasses.values))
          .or(::Daggerheart::Feat.where(origin: 'beastform', origin_value: data.beastform))
      end
      # rubocop: enable Metrics/AbcSize
    end
  end
end
