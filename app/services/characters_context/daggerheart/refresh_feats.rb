# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class RefreshFeats < CharactersContext::RefreshFeats
      REQUIRED_ATTRIBUTES = %i[id slug conditions origin origin_value limit_refresh exclude].freeze

      private

      def remove_redundant_feats(character)
        remove_redundant_spells(character)
      end

      def exclude_origins_from_remove
        ::Daggerheart::Feat::SELECTABLE_ORIGINS
      end

      def remove_redundant_spells(character)
        all_slugs = ::Daggerheart::Feat.where(origin: 'domain_card', kind: 'static_list').pluck(:options).flat_map(&:keys)
        existing_slugs = character.data.selected_features.values.flatten

        feats = ::Daggerheart::Feat.where(slug: all_slugs - existing_slugs).ids
        Character::Feat.where(feat_id: feats, character: character).delete_all
      end

      def filter_available_feats(character)
        selected_feats = find_selected_feats(character)

        feats(character).select(*REQUIRED_ATTRIBUTES).filter_map do |item|
          next item if item.conditions.blank?

          filter_feat(item, character, selected_feats)
        end
      end

      def filter_feat(item, character, selected_feats)
        conditions = item.conditions
        return unless match_by_subclass_mastery?(conditions['subclass_mastery'], item, character)
        return unless match_by_selected_feats?(conditions['selected_feature'], selected_feats)

        item
      end

      def match_by_subclass_mastery?(condition, item, character)
        return true unless condition
        return true unless item.origin == 'subclass'

        character.data.subclasses_mastery[item.origin_value] >= condition
      end

      def match_by_selected_feats?(condition, selected_feats)
        return true unless condition
        return false if ([condition] - selected_feats).any?

        true
      end

      def find_selected_feats(character)
        character.data.selected_features.values.flatten
      end

      def feats(character) # rubocop: disable Metrics/AbcSize
        data = character.data
        ::Daggerheart::Feat.where(
          origin_value: [
            data.heritage, data.community, data.classes.keys, data.subclasses.values, data.beastform, character.id,
            data.transformation
          ].flatten.compact.uniq
        ).or(
          ::Daggerheart::Feat.where(origin: 'ancestry', slug: data.heritage_features)
        ).or(
          ::Daggerheart::Feat.where(origin: 'ancestry', id: data.heritage_features)
        ).or(
          ::Daggerheart::Feat.where(origin: 'domain_card', slug: data.selected_features.values.flatten.compact)
        ).or(
          ::Daggerheart::Feat.where(
            origin: 'parent',
            origin_value: character.feats.where(ready_to_use: true).joins(:feat).where(feats: { kind: 5 }).pluck('feats.slug')
          )
        )
      end
    end
  end
end
