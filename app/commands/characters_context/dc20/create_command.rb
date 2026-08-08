# frozen_string_literal: true

module CharactersContext
  module Dc20
    class CreateCommand < BaseCommand
      include Deps[
        add_feat: 'commands.characters_context.dc20.feats.add',
        refresh_feats: 'services.characters_context.dc20.refresh_feats'
      ]

      ANCESTRY_FEATS = {
        'human' => %w[attribute_increase skill_expertise human_resolve undying],
        'elf' => %w[elven_will nimble agile_explorer discerning_sight],
        'dwarf' => %w[tough toxic_fortitude physically_sturdy iron_stomach],
        'halfling' => %w[small_sized elusive halfling_bravery halfling_endurance deft_footwork beast_whisperer],
        'gnome' => %w[gnome_small_sized magnified_vision mental_clarity strong_minded predict_weather escape_artist],
        'orc' => %w[already_cursed cursed_mind orc_rush brutal_strikes orc_tough orcish_resolve],
        'dragonborn' => %w[darkvision draconic_resistance draconic_breath_weapon reptilian_superiority],
        'giantborn' => %w[giantborn_tough powerful_build unstoppable giant_resolve unyielding_movement],
        'angelborn' => %w[radiant_resistance celestial_magic healing_touch divine_glow],
        'fiendborn' => %w[fiendish_resistance fiendish_magic fiendborn_darkvision light_bane]
      }.freeze

      use_contract do
        Classes = Dry::Types['strict.string'].enum(*::Dc20::Character.classes_info.keys)
        Races = Dry::Types['strict.string'].enum(*::Dc20::Character.ancestries.keys)

        params do
          required(:user).filled(type?: User)
          required(:name).filled(:string, max_size?: 50)
          required(:main_class).filled(Classes)
          optional(:ancestry_feats).maybe(:hash)
          optional(:default_ancestry).maybe(Races)
          optional(:skip_guide).filled(:bool)
        end
      end

      private

      def do_prepare(input)
        input[:ancestry_feats] = ANCESTRY_FEATS.slice(input[:default_ancestry]) if input[:default_ancestry]
        input[:data] = build_fresh_character(input.slice(:main_class, :ancestry_feats, :skip_guide).symbolize_keys)
      end

      def do_persist(input)
        character = ::Dc20::Character.create!(input.slice(:user, :name, :data))

        attach_feats(character, input[:ancestry_feats].values.flatten)
        refresh_feats.call(character: character)

        { result: character }
      end

      def build_fresh_character(data)
        Dc20Character::BaseBuilder.new.call(result: data)
          .then { |result| Dc20Character::ClassBuilder.new.call(result: result) }
      end

      def attach_feats(character, feat_slugs)
        feats_relation(character, feat_slugs).each do |feat|
          add_feat.call({ character: character, feat: feat, with_subfeats: true })
        end
      end

      # при создании присвоить выбранные расовые, классовые и class_flavor навыки 1 уровня, с любыми поднавыками
      def feats_relation(character, feat_slugs)
        ::Dc20::Feat.where(origin: 0, slug: feat_slugs)
          .or(
            ::Dc20::Feat.where(origin: [1, 2], origin_value: character.data.main_class).where("conditions ->> 'level' = '1'")
          )
      end
    end
  end
end
