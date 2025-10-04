# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Pathfinder2
      class Template < SheetsContext::Pdf::Template
        # rubocop: disable Metrics/AbcSize, Layout/LineLength, Metrics/MethodLength, Metrics/PerceivedComplexity
        def to_pdf(character:)
          super

          abilities_names = ::Pathfinder2::Character.abilities
          font_size 6
          fill_color 'FFFFFF'
          %w[str dex con int wis cha].each_with_index do |item, index|
            ability_name = abilities_names[item].dig('name', I18n.locale.to_s)
            text_box ability_name, at: [233 + (55 * index), 736], width: 43, align: :center
          end

          saving_throws = ::Pathfinder2::Character.saving_throws
          font_size 5
          %w[fortitude reflex will].each_with_index do |item, index|
            saving_throw = saving_throws[item].dig('name', I18n.locale.to_s)
            text_box saving_throw, at: [365 + (54 * index), 599.5], width: 36, align: :center
          end

          text_box I18n.t('services.sheets_context.pathfinder.armor_class'), at: [48, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.pathfinder.perception'), at: [101, 700], width: 43, align: :center
          text_box I18n.t('services.sheets_context.pathfinder.speed'), at: [154, 700], width: 43, align: :center

          font_size 12
          fill_color '000000'
          %w[str dex con int wis cha].each_with_index do |item, index|
            value = "#{'+' if character.abilities[item].positive?}#{character.abilities[item]}"
            text_box value, at: [242 + (index * 55), 718], width: 25, height: 14, align: :center
          end

          %w[fortitude reflex will].each_with_index do |item, index|
            value = "#{'+' if character.saving_throws_value[item.to_sym].positive?}#{character.saving_throws_value[item.to_sym]}"
            text_box value, at: [368 + (index * 54), 620], width: 30, height: 14, align: :center
          end

          text_box character.armor_class.to_s, at: [51, 722], width: 37, height: 14, align: :center
          text_box "+#{character.perception}", at: [104, 722], width: 37, height: 14, align: :center
          text_box character.speed.to_s, at: [157, 722], width: 37, height: 14, align: :center

          font_size 16
          text_box character.health['current'].to_s, at: [30, 624], width: 70, align: :center
          text_box character.health['max'].to_s, at: [110, 624], width: 70, align: :center
          text_box character.health['temp'].to_s, at: [190, 624], width: 70, align: :center

          font_size 10
          fill_color '000000'

          skills_names = ::Pathfinder2::Character.skills
          character.skills.map { |skill|
            skill[:name] = skill[:name] || skills_names[skill[:slug]].dig('name', I18n.locale.to_s)
            skill
          }.sort_by { |item| item[:name] }.each_with_index do |skill, index| # rubocop: disable Style/MultilineBlockChain
            text_box skill[:name], at: [52, 511 - (index * 20)], width: 140
            text_box "#{'+' if skill[:modifier].positive?}#{skill[:modifier]}", at: [200, 511 - (index * 20)], width: 38, align: :center
          end

          text_box I18n.t('services.sheets_context.dnd.health'), at: [70, 659], width: 150, align: :center
          text_box I18n.t('services.sheets_context.dnd.saving_throws'), at: [346, 659], width: 175, align: :center
          text_box I18n.t('services.sheets_context.dnd.skills'), at: [70, 538], width: 150, align: :center

          font_size 6
          text_box I18n.t('services.sheets_context.dnd.current_health').upcase, at: [30, 600], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.max_health').upcase, at: [110, 600], width: 70, align: :center
          text_box I18n.t('services.sheets_context.dnd.temp_health').upcase, at: [190, 600], width: 70, align: :center

          render
        end
        # rubocop: enable Metrics/AbcSize, Layout/LineLength, Metrics/MethodLength, Metrics/PerceivedComplexity

        private

        def heritage(character)
          "#{subrace(character)} / #{background(character)}"
        end

        def classes(character)
          character.subclasses.map { |key, value| "#{class_name(key)} (#{subclass_name(key, value)})" }.join(' / ')
        end

        def subrace(character)
          ::Pathfinder2::Character.subrace_info(character.race, character.subrace).dig('name', I18n.locale.to_s)
        end

        def background(character)
          ::Pathfinder2::Character.backgrounds.dig(character.background, 'name', I18n.locale.to_s)
        end

        def class_name(class_slug)
          ::Pathfinder2::Character.class_info(class_slug).dig('name', I18n.locale.to_s)
        end

        def subclass_name(class_slug, subclass_slug)
          ::Pathfinder2::Character.subclass_info(class_slug, subclass_slug).dig('name', I18n.locale.to_s)
        end
      end
    end
  end
end
