# frozen_string_literal: true

module Dnd2024
  class Character
    class Feature < ApplicationRecord
      self.table_name = :dnd2024_character_features

      SPECIES_ORIGIN = 'species'
      CLASS_ORIGIN = 'class'

      STATIC = 'static' # рендерится текст
      STATIC_LIST = 'static_list' # рендерится список, выбирается одно значение
      DYNAMIC_LIST = 'dynamic_list' # рендерится список, выбирается несколько значений
      CHOOSE_FROM = 'choose_from' # рендерится динамический список, выбирается несколько значений
      CHOOSE_ONE_FROM = 'choose_one_from' # рендерится динамический список, выбирается одно значение
      TEXT = 'text' # рендерится текст, вводится текст
      UPDATE_RESULT = 'update_result' # не рендерится, обновляются данные декоратора

      SHORT_REST = 'short_rest'
      LONG_REST = 'long_rest'

      enum :origin, { SPECIES_ORIGIN => 0, CLASS_ORIGIN => 1 }
      enum :kind, {
        STATIC => 0, STATIC_LIST => 1, DYNAMIC_LIST => 2, CHOOSE_FROM => 3, TEXT => 4, UPDATE_RESULT => 5, CHOOSE_ONE_FROM => 6
      }
      enum :limit_refresh, { SHORT_REST => 0, LONG_REST => 1 }
    end
  end
end
