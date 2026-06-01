# frozen_string_literal: true

module SheetsContext
  module Json
    module Daggerheart
      class Generate
        def to_json(character:) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
          decorator = character.decorator

          {
            name: decorator.name,
            ancestry: character.ancestry_name,
            community: character.community_name,
            level: decorator.level,
            classes: decorator.subclass_names.map { |key, value| "#{key} (#{value})" }.join(' / '),
            domains: domains(decorator),
            domain_cards: domain_cards(character),
            traits: decorator.modified_traits,
            armor: decorator.armor_score,
            evasion: decorator.evasion,
            experience: decorator.experience.map { |item| item.except('id') },
            thresholds: decorator.damage_thresholds,
            health_max: decorator.health_max,
            health_marked: decorator.health_marked,
            stress_max: decorator.stress_max,
            stress_marked: decorator.stress_marked,
            hope_max: decorator.hope_max,
            hope_marked: decorator.hope_marked,
            armor_slots: decorator.spent_armor_slots,
            attacks: attacks(decorator)
          }
        end

        private

        def domains(decorator)
          decorator.selected_domains.map(&:capitalize)
        end

        def domain_cards(character)
          result = character.feats.includes(:feat).where(feats: { origin: 7 }).map do |item|
            {
              name: item.feat.title['en'],
              ready_to_use: item.ready_to_use
            }
          end

          {
            loadout: result.select { |item| item[:ready_to_use] }.pluck(:name),
            vault: result.reject { |item| item[:ready_to_use] }.pluck(:name)
          }
        end

        def attacks(decorator)
          decorator.attacks.map do |item|
            item.slice(:name, :attack_bonus, :damage, :damage_bonus)
          end
        end
      end
    end
  end
end
