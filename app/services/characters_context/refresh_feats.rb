# frozen_string_literal: true

module CharactersContext
  class RefreshFeats
    def call(character:)
      existing_ids = Character::Feat.where(character_id: character.id).pluck(:feat_id)
      available_feats = find_available_feats(character)

      remove_not_available_feats(character, existing_ids, available_feats)
      add_new_available_feats(character, available_feats, existing_ids)
    end

    private

    def find_available_feats(character)
      all_feats = filter_available_feats(character)
      exclude_feats = all_feats.pluck(:exclude).flatten.uniq
      all_feats.reject { |item| item.slug.in?(exclude_feats) }
    end

    def remove_not_available_feats(character, existing_ids, available_feats)
      Character::Feat.where(character_id: character.id, feat_id: (existing_ids - available_feats.pluck(:id))).destroy_all
    end

    def add_new_available_feats(character, available_feats, existing_ids)
      feats_for_adding = available_feats.filter_map do |item|
        next if item.id.in?(existing_ids)

        {
          character_id: character.id,
          feat_id: item.id,
          used_count: 0,
          limit_refresh: item.limit_refresh
        }
      end
      ::Character::Feat.upsert_all(feats_for_adding) if feats_for_adding.any?
    end
  end
end
