# frozen_string_literal: true

module CharactersContext
  module Daggerheart
    class GenerateJsonCharacterSheet
      # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
      def to_json(character:)
        {
          name: character.name,
          ancestry: ancestry(character),
          community: community(character),
          level: character.level,
          classes: character.subclasses.map { |key, value| "#{class_name(key)} (#{subclass_name(key, value)})" },
          domains: domains(character),
          traits: character.modified_traits,
          armor: character.armor_score,
          evasion: character.evasion,
          experience: character.experience.map { |item| item.except('id') },
          thresholds: character.damage_thresholds,
          health_max: character.health_max,
          health_marked: character.health_marked,
          stress_max: character.stress_max,
          stress_marked: character.stress_marked,
          hope_max: character.hope_max,
          hope_marked: character.hope_marked,
          armor_slots: character.spent_armor_slots,
          attacks: attacks(character)
        }
      end
      # rubocop: enable Metrics/AbcSize, Metrics/MethodLength

      private

      def ancestry(character)
        return character.heritage_name if character.heritage.nil?

        ::Daggerheart::Character.heritage_info(character.heritage).dig('name', I18n.locale.to_s)
      end

      def community(character)
        ::Daggerheart::Character.communities[character.community].dig('name', I18n.locale.to_s)
      end

      def class_name(class_slug)
        default = ::Daggerheart::Character.class_info(class_slug)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Speciality.find(class_slug).name
      end

      def subclass_name(class_slug, subclass_slug)
        default = ::Daggerheart::Character.subclass_info(class_slug, subclass_slug)
        default ? default.dig('name', I18n.locale.to_s) : ::Daggerheart::Homebrew::Subclass.find(subclass_slug).name
      end

      def domains(character)
        character.selected_domains.map(&:capitalize)
      end

      def attacks(character)
        character.attacks.map do |item|
          item.slice(:name, :attack_bonus, :damage, :damage_bonus)
        end
      end
    end
  end
end
