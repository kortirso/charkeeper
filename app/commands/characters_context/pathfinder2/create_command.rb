# frozen_string_literal: true

module CharactersContext
  module Pathfinder2
    class CreateCommand < BaseCommand
      include Deps[
        add_feat: 'commands.characters_context.pathfinder2.feats.add',
        add_spell: 'commands.characters_context.pathfinder2.spells.add',
        refresh_feats: 'services.characters_context.pathfinder2.refresh_feats'
      ]

      # rubocop: disable-next Metrics/BlockLength
      use_contract do
        config.messages.namespace = :pathfinder2_character

        Races = Dry::Types['strict.string'].enum(*::Pathfinder2::Character.races.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:race).filled(Races)
          required(:background).filled(:string)
          required(:main_class).filled(:string)
          required(:subrace).filled(:string)
          optional(:subclass).filled(:string)
          optional(:main_ability).filled(:string)
        end

        rule(:race, :subrace) do
          next if values[:subrace].nil?

          subraces = ::Pathfinder2::Character.subraces(values[:race]).keys
          next if subraces&.include?(values[:subrace])

          key(:subrace).failure(:invalid)
        end

        rule(:main_class, :subclass) do
          default = ::Pathfinder2::Character.classes_info[values[:main_class]]
          if default
            if default['subclass_title'] && values[:subclass].blank?
              key(:subclass).failure(:filled?)
            end
          else
            record = ::Pathfinder2::Homebrews::Speciality.find_by(id: values[:main_class])
            if record&.info&.subclass_title.present? && values[:subclass].blank?
              key(:subclass).failure(:filled?)
            end
          end
        end
      end

      private

      def do_prepare(input)
        input[:data] =
          build_fresh_character(
            input.slice(:race, :subrace, :background, :main_class, :subclass, :main_ability).symbolize_keys
          )

        input[:feats] = input[:data].delete(:feats)
        input[:spells] = input[:data].delete(:spells)
        input[:focus_spells] = input[:data].delete(:focus_spells)
      end

      def do_persist(input)
        character = ::Pathfinder2::Character.create!(input.slice(:user, :name, :data))

        add_background_feat(character)
        add_feats(character, input) if input[:feats].any?
        add_spells(character, input[:spells], 'additional') if input[:spells].any?
        add_spells(character, input[:focus_spells], 'focus') if input[:focus_spells].any?
        refresh_feats.call(character: character)

        { result: character }
      end

      def build_fresh_character(data)
        Pathfinder2Character::BaseBuilder.new.call(result: data)
          .then { |result| Pathfinder2Character::RaceBuilder.new.call(result: result) }
          .then { |result| Pathfinder2Character::SubraceBuilder.new.call(result: result) }
          .then { |result| Pathfinder2Character::BackgroundBuilder.new.call(result: result) }
          .then { |result| Pathfinder2Character::ClassBuilder.new.call(result: result) }
          .then { |result| Pathfinder2Character::SubclassBuilder.new.call(result: result) }
      end

      def add_background_feat(character)
        background =
          Config.data('pathfinder2', 'backgrounds')[character.data.background] ||
            ::Pathfinder2::Homebrews::Background.find_by(id: character.data.background)&.info&.attributes
        return unless background
        return unless background['feat']

        feat = ::Pathfinder2::Feat.find_by(slug: background['feat']) || ::Pathfinder2::Feat.find_by(id: background['feat'])
        return unless feat

        add_feat.call(character: character, id: feat.id, type: 'additional', level: 1)
      end

      def add_feats(character, input)
        input[:feats].each do |slug|
          feat = ::Pathfinder2::Feat.where.not(origin: 4).find_by(slug: slug)
          next unless feat

          add_feat.call(character: character, id: feat.id, type: 'additional', level: 1)
        end
      end

      def add_spells(character, spells, kind)
        spells.each do |slug|
          spell = ::Pathfinder2::Feat.where(origin: 4).find_by(slug: slug)
          next unless spell

          add_spell.call({
            character: character, feat: spell, level: spell.info['level'], kind: kind
          }.compact_blank)
        end
      end
    end
  end
end
