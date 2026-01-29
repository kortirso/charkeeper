# frozen_string_literal: true

module SheetsContext
  module Pdf
    class Template < Prawn::Document
      # rubocop: disable Metrics/AbcSize, Layout/LineLength
      def to_pdf(character:)
        font_families.update(
          'CascadiaMono' => {
            normal: Rails.root.join('app/assets/fonts/CascadiaMono-Light.ttf'),
            bold: Rails.root.join('app/assets/fonts/CascadiaMono-Regular.ttf'),
            italic: Rails.root.join('app/assets/fonts/CascadiaMono-LightItalic.ttf')
          }
        )
        font 'CascadiaMono'

        font_size 12
        fill_color 'FFFFFF'
        text_box character.name, at: [30, 812], width: 180

        font_size 6
        text_box I18n.t('services.sheets_context.level'), at: [531, 785], width: 40, align: :center

        font_size 8
        fill_color '000000'
        text_box heritage(character), at: [270, 815], width: 230
        text_box classes(character), at: [270, 796], width: 230

        font_size 14
        stroke_color '000000'
        text_box character.level.to_s, at: [533, 809], width: 37, height: 18, align: :center
      end

      def render_equipment_page(character) # rubocop: disable Metrics/MethodLength, Metrics/PerceivedComplexity
        start_new_page

        font_size 10
        fill_color '000000'
        text_box I18n.t('services.sheets_context.equipment'), at: [210, 818], width: 175, align: :center

        font_size 4
        fill_color '444444'
        text_box I18n.t('services.sheets_context.count'), at: [242, 736], width: 40, height: 10, align: :center
        text_box I18n.t('services.sheets_context.count'), at: [509, 736], width: 40, height: 10, align: :center

        row_index = 0
        column_index = 0
        items = character.parent.items.includes(:item).to_a.sort_by { |item| item.item.name[I18n.locale.to_s] }

        fill_color '000000'
        %w[hands equipment backpack storage].each do |key|
          next if column_index == 2

          items.select { |item| item.states[key]&.positive? }.each do |item|
            next if column_index == 2

            font_size 8
            text_box item.item.name[I18n.locale.to_s], at: [52 + (column_index * 267), 726 - (row_index * 28)], width: 140, height: 14
            text_box item.states[key].to_s, at: [242 + (column_index * 267), 726 - (row_index * 28)], width: 40, height: 14, align: :center

            font_size 5
            text_box I18n.t("services.sheets_context.equipments.#{key}"), at: [202 + (column_index * 267), 724 - (row_index * 28)], width: 40, height: 14, align: :center

            if row_index == 24
              row_index = 0
              column_index += 1
            else
              row_index += 1
            end
          end
        end
      end
      # rubocop: enable Metrics/AbcSize, Layout/LineLength
    end
  end
end
