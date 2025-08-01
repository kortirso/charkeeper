# frozen_string_literal: true

module CharactersContext
  module Dnd2024
    class RefreshFeats < CharactersContext::RefreshFeats
      REQUIRED_ATTRIBUTES = %i[id slug conditions origin origin_value limit_refresh exclude].freeze

      private

      def filter_available_feats(character)
        selected_feats = find_selected_feats(character)
        subclasses_levels = find_subclasses_levels(character)

        feats(character).select(*REQUIRED_ATTRIBUTES).filter_map do |item|
          next item if item.conditions.blank?

          filter_feat(item, character, subclasses_levels, selected_feats)
        end
      end

      def filter_feat(item, character, subclasses_levels, selected_feats)
        conditions = item.conditions
        return unless match_by_level?(conditions['level'], item, character, subclasses_levels)
        return unless match_by_selected_feats?(conditions['selected_feats'], selected_feats)

        item
      end

      def match_by_level?(condition, item, character, subclasses_levels)
        return true unless condition
        return false if item.origin == 'subclass' && subclasses_levels[item.origin_value] < condition
        return false if item.origin == 'class' && character.data.classes[item.origin_value] < condition
        return false if item.origin == 'species' && character.data.level < condition

        true
      end

      def match_by_selected_feats?(condition, selected_feats)
        return true unless condition
        return false if (condition - selected_feats).any?

        true
      end

      def find_selected_feats(character)
        character.data.selected_features.values.flatten
      end

      def find_subclasses_levels(character)
        character.data.subclasses.to_h { |key, value| [value, character.data.classes[key]] }
      end

      def feats(character)
        data = character.data
        ::Dnd2024::Feat.where(
          origin_value: [data.species, data.legacy, data.classes.keys, data.subclasses.values].flatten.compact.uniq
        ).or(::Dnd2024::Feat.where(origin: 'feat', slug: data.selected_feats))
      end
    end
  end
end
