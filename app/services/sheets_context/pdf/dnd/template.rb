# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dnd
      class Template < SheetsContext::Pdf::Template
        # rubocop: disable Metrics/AbcSize, Layout/LineLength,  Metrics/MethodLength
        def to_pdf(character:)
          super

          abilities_names = ::Dnd2024::Character.abilities
          font Rails.root.join('app/assets/fonts/Roboto-Regular.ttf') do
            font_size 6
            fill_color 'FFFFFF'
            %w[str dex con int wis cha].each_with_index do |item, index|
              ability_name = abilities_names[item].dig('name', I18n.locale.to_s)
              text_box ability_name, at: [233 + (55 * index), 735], width: 43, align: :center
            end

            text_box I18n.t('services.sheets_context.dnd.armor_class'), at: [48, 699], width: 43, align: :center
            text_box I18n.t('services.sheets_context.dnd.initiative'), at: [101, 699], width: 43, align: :center
            text_box I18n.t('services.sheets_context.dnd.speed'), at: [154, 699], width: 43, align: :center
          end

          fill_color '000000'
          %w[str dex con int wis cha].each_with_index do |item, index|
            font_size 12
            text_box character.modified_abilities[item].to_s, at: [242 + (index * 55), 720], width: 25, height: 14, align: :center

            font_size 10
            value = "#{'+' if character.modifiers[item].positive?}#{character.modifiers[item]}"
            text_box value, at: [245.5 + (index * 55), 699], width: 18, height: 14, align: :center
          end

          font_size 12
          text_box character.armor_class.to_s, at: [51, 722], width: 37, height: 14, align: :center
          text_box "+#{character.initiative}", at: [104, 722], width: 37, height: 14, align: :center
          text_box character.speed.to_s, at: [157, 722], width: 37, height: 14, align: :center

          font_size 16
          text_box character.health['current'].to_s, at: [30, 624], width: 70, align: :center
          text_box character.health['max'].to_s, at: [110, 624], width: 70, align: :center
          text_box character.health['temp'].to_s, at: [190, 624], width: 70, align: :center

          font_size 8
          text_box 'd6', at: [50, 576], width: 40
          text_box 'd8', at: [50, 561], width: 40
          text_box 'd10', at: [50, 546], width: 40
          text_box 'd12', at: [50, 531], width: 40

          text_box "#{character.hit_dice['6'] - character.spent_hit_dice['6'].to_i} / #{character.hit_dice['6']}", at: [100, 576], width: 40
          text_box "#{character.hit_dice['8'] - character.spent_hit_dice['8'].to_i} / #{character.hit_dice['8']}", at: [100, 561], width: 40
          text_box "#{character.hit_dice['10'] - character.spent_hit_dice['10'].to_i} / #{character.hit_dice['10']}", at: [100, 546], width: 40
          text_box "#{character.hit_dice['12'] - character.spent_hit_dice['12'].to_i} / #{character.hit_dice['12']}", at: [100, 531], width: 40

          font Rails.root.join('app/assets/fonts/Roboto-Regular.ttf') do
            font_size 10
            fill_color '000000'

            skills_names = ::Dnd2024::Character.skills
            character.skills.map { |skill|
              skill[:name] = skills_names[skill[:slug]].dig('name', I18n.locale.to_s)
              skill
            }.sort_by { |item| item[:name] }.each_with_index do |skill, index| # rubocop: disable Style/MultilineBlockChain
              text_box skill[:name], at: [52, 465 - (index * 20)], width: 140
              text_box "#{'+' if skill[:modifier].positive?}#{skill[:modifier]}", at: [200, 465 - (index * 20)], width: 38, align: :center
            end

            text_box I18n.t('services.sheets_context.dnd.health'), at: [70, 656], width: 150, align: :center
            text_box I18n.t('services.sheets_context.dnd.skills'), at: [70, 491], width: 150, align: :center

            font_size 6
            text_box I18n.t('services.sheets_context.dnd.current_health').upcase, at: [30, 600], width: 70, align: :center
            text_box I18n.t('services.sheets_context.dnd.max_health').upcase, at: [110, 600], width: 70, align: :center
            text_box I18n.t('services.sheets_context.dnd.temp_health').upcase, at: [190, 600], width: 70, align: :center

            font_size 8
            text_box I18n.t('services.sheets_context.dnd.success'), at: [168, 575], width: 40
            text_box I18n.t('services.sheets_context.dnd.failure'), at: [168, 560], width: 40
          end

          fill_color 'C6515C'
          character.death_saving_throws['success'].times do |index|
            fill_and_stroke_rounded_rectangle [222.5 + (index * 13), 578.5], 11, 11, 1
          end
          character.death_saving_throws['failure'].times do |index|
            fill_and_stroke_rounded_rectangle [222.5 + (index * 13), 563.5], 11, 11, 1
          end
        end
        # rubocop: enable Metrics/AbcSize, Layout/LineLength,  Metrics/MethodLength
      end
    end
  end
end
