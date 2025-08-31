# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class GenerateJsonCharacterSheet
      # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
      def to_json(character:)
        decorator = character.decorator

        {
          name: decorator.name,
          ancestry: ancestry(decorator),
          community: community(decorator),
          level: decorator.level,
          classes: decorator.subclasses.map { |key, value| "#{class_name(key)} (#{subclass_name(key, value)})" },
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
      # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

      private

      def ancestry(decorator)
        return decorator.heritage_name if decorator.heritage.nil?

        ::Daggerheart::Character.heritage_info(decorator.heritage).dig('name', I18n.locale.to_s)
      end

      def community(decorator)
        ::Daggerheart::Character.communities[decorator.community].dig('name', I18n.locale.to_s)
      end

      def class_name(class_slug)
        default = ::Daggerheart::Character.class_info(class_slug)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Speciality.find(class_slug).name
      end

      def subclass_name(class_slug, subclass_slug)
        default = ::Daggerheart::Character.subclass_info(class_slug, subclass_slug)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Subclass.find(subclass_slug).name
      end

      def domains(decorator)
        decorator.selected_domains.map(&:capitalize)
      end

      def domain_cards(character)
        result = character.spells.includes(:spell).map do |item|
          {
            name: item.spell.name['en'],
            ready_to_use: item.data['ready_to_use']
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
