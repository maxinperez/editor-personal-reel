# Estilo editorial (subtítulos y montaje)

Especificación del estilo que usan los reels con `captionStyle: "editorial"`. Sale del análisis cuadro a
cuadro de dos reels de referencia (orador a cámara + ráfagas de B-roll + subtítulos en dos tipografías).
Los videos de referencia no forman parte del repositorio.

## Montaje

- **Plano base:** el orador (o la voz en off sobre B-roll/gráficos).
- **Ráfagas de B-roll:** cuando se nombra algo concreto o emocional, cortes secos a clips que ilustran la palabra
  de forma literal. En las referencias, cada clip dura entre 0,4 y 1,8 s; en este proyecto se usan 2-3 s para un
  ritmo más calmo.
- **Cortes secos.** Sin transiciones decoradas.
- **Clips a 9:16 a pantalla completa**, con un look de color parejo (`grade`: `cine`, `frio`, `calido`) y un
  zoom lento para que ningún plano quede estático.

## Subtítulos

Dos estilos conviven en el mismo bloque. Blanco puro, sin puntuación final.

|                    | Palabras comunes                      | Palabra clave                            |
| ------------------ | ------------------------------------- | ---------------------------------------- |
| Tipografía         | Inter Tight 700                       | Instrument Serif Italic 400              |
| Tamaño (1080×1920) | ≈ 66 px                               | 110-300 px, según el largo de la palabra |
| Interletrado       | ≈ -0,04 em                            | ≈ -0,03 em                               |
| Sombra             | `0 3px 10px rgba(0,0,0,.45)`          | `0 4px 12px rgba(0,0,0,.5)`              |
| Cantidad           | hasta 4 antes y 2 después de la clave | una por bloque                           |

Composición del bloque:

```
   antes de meter            <- sans, arriba (se superpone apenas a la serif)
        IA                   <- serif cursiva grande, centrada
           en tu empresa     <- sans, abajo a la derecha
```

- La palabra clave se marca en el guion con `*asteriscos*` dentro de `vo`. Siempre un sustantivo, verbo o palabra
  con carga emocional; nunca un conector.
- Posición vertical por escena con `captionY` (porcentaje del alto; 54 por defecto). Sobre planillas o gráficos
  conviene bajarla (ej. 74).

### Animación

1. Las palabras comunes **se acumulan una a una**, sincronizadas con la voz, con un fundido de ~2 cuadros.
2. La palabra clave **entra de golpe**, sin escala ni movimiento: el efecto lo da el contraste tipográfico.
3. El bloque queda quieto mientras dura la frase.
4. **Sin salida:** al cambiar de frase (punto o coma) el bloque se reemplaza en seco.
5. Los subtítulos no se mueven con el video y pueden atravesar un corte de plano.

## Sincronía con la voz

Cada palabra aparece cuando se pronuncia, no antes. `npm run voz` usa las marcas DTW de Whisper corregidas
por su retraso medido en la propia grabación y las ajusta a las pausas del audio (`src/lib/snap.ts`).

## Dónde está en el código

| Pieza                            | Archivo                                |
| -------------------------------- | -------------------------------------- |
| Subtítulos editoriales           | `src/components/EditorialCaptions.tsx` |
| Escena de B-roll y etiqueta fija | `src/scenes/Broll.tsx`                 |
| Looks de color                   | `src/lib/look.ts`                      |
| Tipografías                      | `src/theme.ts`                         |
